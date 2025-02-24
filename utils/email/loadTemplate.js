const fs = require('fs');
const path = require('path');

const loadTemplate = (templateName, placeholders) => {
  console.log(__dirname)
  const templatePath = path.join(__dirname, '../../emailTemplates', `${templateName}.html`);
  let templateContent = fs.readFileSync(templatePath, 'utf-8');
  
  for (const [key, value] of Object.entries(placeholders)) {
    templateContent = templateContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return templateContent;
};

module.exports = loadTemplate;
