// Validator function
function validateFormData(formData, formFields) {
  // Initialize errors array to collect validation errors
  let errors = [];

  // Validate each section
  formFields.sections.forEach(section => {
    const sectionId = section.sectionId;

    // Check if section exists in formData
    if (!(sectionId in formData)) {
      errors.push(`Section ${sectionId} is missing.`);
      return; // Skip further validation for this section
    }

    // Validate each field in the section
    section.fields.forEach(field => {
      const fieldName = field.name;
      const fieldValue = formData[sectionId][0][fieldName]; // Assuming single object per section

      // Validate field based on its type
      switch (field.type) {
        case 'text':
          // Check length validation
          field.validation.forEach(validation => {
            if (validation.condition === 'length') {
              if (validation.operator === '<' && fieldValue.length >= validation.value) {
                errors.push(`${field.label} should be less than ${validation.value} characters.`);
              }
            }
          });
          break;
        case 'number':
          // Check numeric value validation
          field.validation.forEach(validation => {
            if (validation.condition === 'value') {
              if (validation.operator === '>' && fieldValue <= validation.value) {
                errors.push(`${field.label} should be greater than ${validation.value}.`);
              }
              if (validation.operator === '<=' && fieldValue > validation.value) {
                errors.push(`${field.label} should be less than or equal to ${validation.value}.`);
              }
            }
          });
          break;
        case 'email':
          // Check email format validation using regex pattern
          field.validation.forEach(validation => {
            if (validation.condition === 'regex') {
              const pattern = new RegExp(validation.pattern);
              if (!pattern.test(fieldValue)) {
                errors.push(validation.message);
              }
            }
          });
          break;
        case 'checkbox':
          // Check count validation for checkbox options
          field.validation.forEach(validation => {
            if (validation.condition === 'count') {
              const numOptions = fieldValue.length;
              if (validation.operator === '>=' && numOptions < validation.value) {
                errors.push(`Select at least ${validation.value} options for ${field.label}.`);
              }
            }
          });
          break;
        default:
          break;
      }
    });

    // Validate conditions for the section
    section.conditions.forEach(condition => {
      const { conditionType, conditionOn, condition, conditionValue, destinationSection, fallbackSection } = condition;

      switch (conditionType) {
        case 'value':
          // Check value-based condition
          if (formData[sectionId][0][conditionOn] <= conditionValue) {
            // Check destination section existence
            if (!(destinationSection in formData)) {
              errors.push(`Destination section ${destinationSection} is missing.`);
            }
          } else {
            // Check fallback section existence
            if (!(fallbackSection in formData)) {
              errors.push(`Fallback section ${fallbackSection} is missing.`);
            }
          }
          break;
        case 'count':
          // Check count-based condition (not implemented in this example)
          // Here you would check conditions based on the count of selected options, etc.
          break;
        case 'default':
          // Default condition type (not implemented in this example)
          break;
        default:
          break;
      }
    });
  });

  return errors;
}

module.exports = validateFormData;




    // const arrayOfFormSections = sections.map(section => section._id);
    // const arrayOfFormFields = sections.flatMap(section => section.fields.map(field => field._id));

    // console.log("Actual form sections", arrayOfFormSections);
    // console.log("Actual form fields", arrayOfFormFields);

    // let isFormSanitized = userSubmittedSections.every(section => {
    //     if (!arrayOfFormSections.includes(section._id)) {
    //         console.log("Manipulated section: " + section.name, section._id);
    //         return false;
    //     } else {
    //         console.log("Entering field search for: ", section.name);
    //         return section.fields.every(field => {
    //             if (!arrayOfFormFields.includes(field._id)) {
    //                 console.log("Manipulated field: " + field.name, field._id);
    //                 return false;
    //             }
    //             return true;
    //         });
    //     }
    // });

    // console.log(isFormSanitized)

    // if (!isFormSanitized) {
    //     throw new ApiError(400, "Manipulated section/Field data");
    // }

    // console.log("correct sections value", isFormSanitized);