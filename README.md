# a simple openapi docs watcher to apifox

## features

- auto sync api docs to apifox when file changed
- customizable endpoint, support self hosted apifox server
- support multiple projects and documents
- support sync from url
- support custom config file path

## usage

```bash
# Install globally
npm install -g apifox-autoimport

# Run with default config file (config.yaml)
apifox-autoimport

# Run with custom config file
apifox-autoimport -c /path/to/your/config.yaml

# Show help
apifox-autoimport --help
```

Create your config file:

```yaml
projects:
  - name: Your Project Name
    projectId: your_apifox_project_id
    apiKey: your_apifox_api_key
    docPaths:
      - /path/to/your/api/doc1.yaml
      - /path/to/your/api/doc2.yaml
    apiUrl: https://api.apifox.com/api/v1/projects/:projectId/import-data
```
