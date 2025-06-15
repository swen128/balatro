export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-empty': [2, 'never'],
    'body-format': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'body-format': ({ body }) => {
          if (!body) {
            return [false, 'Commit body is required'];
          }
          
          const hasOverview = body.includes('# Overview');
          const hasBackground = body.includes('# Background');
          const hasCoAuthored = body.includes('Co-authored-by:') || body.includes('Co-Authored-By:');
          
          const errors = [];
          
          if (!hasOverview) {
            errors.push('Missing "# Overview" section');
          }
          
          if (!hasBackground) {
            errors.push('Missing "# Background" section');
          }
          
          if (!hasCoAuthored) {
            errors.push('Missing "Co-authored-by:" or "Co-Authored-By:" line');
          }
          
          if (errors.length > 0) {
            return [false, `Commit body must include:\n${errors.join('\n')}`];
          }
          
          return [true];
        },
      },
    },
  ],
};