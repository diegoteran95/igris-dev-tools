export const Formatter = {
  parse(jsonString) {
    try {
      // 1. Try normal parse
      let data = JSON.parse(jsonString);

      // 2. If the result is a string, it might be a stringified JSON (double encoded)
      // e.g. "{\"a\":1}" -> parses to string '{"a":1}' -> needs another parse
      if (typeof data === 'string') {
        try {
          const innerData = JSON.parse(data);
          // If successful, use the inner data
          data = innerData;
        } catch (e) {
          // If inner parse fails, it was just a regular string, keep original data
        }
      }

      return { data, error: null };
    } catch (e) {
      // 3. If normal parse failed, it might be a raw escaped string copied from a log
      // e.g. {\"a\":1} (invalid JSON because of backslashes)
      try {
        // Try to unescape manually: replace \" with "
        // We also need to handle cases where it might be wrapped in quotes but they were missed or it's just the content
        let cleaned = jsonString.replace(/\\"/g, '"');

        // If it starts with " and ends with ", but we just replaced internal \" with ",
        // we might have messed up if it was a valid string.
        // But here we are in the catch block of the first parse, so it wasn't valid.

        // Another common case: {\"a\": \"b\"} -> {"a": "b"}
        const data = JSON.parse(cleaned);
        return { data, error: null };
      } catch (e2) {
         return { data: null, error: e };
      }
    }
  },

  format(json, indent = 2) {
    return JSON.stringify(json, null, indent);
  },

  minify(json) {
    return JSON.stringify(json);
  },

  escape(json) {
    // First, ensure we have a formatted JSON string
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    // Escape double quotes with backslash
    return jsonString.replace(/"/g, '\\"');
  },

  highlight(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2);
    }

    // Escape HTML entities to prevent XSS
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  },

  getErrorDetails(error) {
    // Extract line and column from error message if possible
    // V8 error messages usually look like: "Unexpected token } in JSON at position 123"
    // We might need more sophisticated parsing to get line/column from position
    return error.message;
  }
};
