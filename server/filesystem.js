const fs = require('fs');

function fileSystem({ server }) {
  server.post('/check_existing_file', async (req, res) => {
    try {
      const { filePath } = req.body;
      console.log('backend');
      console.log(req.body);
      const response = fs.existsSync(filePath);
      console.log(response);
      res.json(response);
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  });

  server.post('/delete_existing_file', async (req, res) => {
    try {
      const { filepath } = req.body;
      fs.rmSync(filepath, { force: true });
      res.json(true);
    } catch (err) {
      res.json({ error: err.message || err.toString() });
    }
  });
}

module.exports = fileSystem;
