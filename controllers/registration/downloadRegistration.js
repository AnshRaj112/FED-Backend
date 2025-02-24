const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const expressAsyncHandler = require('express-async-handler');
const prisma = new PrismaClient();

// Recursive function to flatten nested objects and arrays
const flattenObject = (obj, prefix = '') => {
    let result = {};

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}_${key}` : key;
        

        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    console.log("value inside Array.isArray if:",value);
                    Object.assign(result, flattenObject(item, `${newKey}_${index + 1}`));
                });
            } else {
                Object.assign(result, flattenObject(value, newKey));
            }
        } else {
            result[newKey] = value;
        }
    });

    return result;
};

const downloadRegistration = expressAsyncHandler(async (req, res, next) => {
    const formId = req.params.id;

    if (!formId) {
        return next(new Error('FormId is missing'));
    }

    try {
        // Fetch data from the database
        const formData = await prisma.formRegistration.findMany({
            where: { formId: formId }
        });

        console.log("form data", formData);
        

        if (!formData || formData.length === 0) {
            return next(new Error('Form data not found'));
        }

        // Prepare the workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Form Registrations');

        // Initialize headers and rows
        let headers = [];
        let rows = [];

        // Iterate through each formData entry to collect headers and rows
        formData.forEach(entry => {
            // Flatten each item in the 'value' array
            const flattenedValues = entry.value.map(item => flattenObject(item));

            flattenedValues.forEach(rowData => {
                // Collect headers from the flattened object
                Object.keys(rowData).forEach(header => {
                    if (!headers.includes(header)) {
                        headers.push(header);
                    }
                });
                rows.push(rowData); // Add row to rows array
            });
        });

        // Add headers to worksheet
        worksheet.columns = headers.map(header => ({ header, key: header }));

        // Add rows to worksheet
        rows.forEach(rowData => {
            worksheet.addRow(rowData);
        });

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set the appropriate headers for downloading the Excel file
        res.setHeader('Content-Disposition', 'attachment; filename=form_registrations.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        return next(error);
    }
});

module.exports = { downloadRegistration };
