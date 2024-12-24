# a simple openapi docs watcher to apifox

## features

- auto sync api docs to apifox when file changed
- customizable endpoint, support self hosted apifox server
- support multiple projects and documents
- support sync from url

## usage

```bash
cp config.example.yaml config.yaml
```

Then edit config.yaml with your own values:

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
