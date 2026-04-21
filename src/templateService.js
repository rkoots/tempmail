class TemplateService {
  static createTemplateProcessor(template) {
    return (recipient) => {
      let processedTemplate = template;
      
      // Replace all {{variable}} placeholders with recipient data
      Object.keys(recipient).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = recipient[key] || '';
        processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value);
      });
      
      return processedTemplate;
    };
  }

  static validateTemplate(template, availableColumns) {
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = [];
    let match;
    
    while ((match = placeholderRegex.exec(template)) !== null) {
      placeholders.push(match[1]);
    }
    
    const errors = [];
    const warnings = [];
    
    placeholders.forEach(placeholder => {
      if (!availableColumns.includes(placeholder) && placeholder !== 'email') {
        warnings.push(`Variable "${placeholder}" not found in CSV columns`);
      }
    });
    
    return {
      placeholders,
      errors,
      warnings,
      isValid: errors.length === 0
    };
  }

  static previewTemplate(template, sampleRecipient) {
    const processor = this.createTemplateProcessor(template);
    return processor(sampleRecipient);
  }
}

module.exports = TemplateService;
