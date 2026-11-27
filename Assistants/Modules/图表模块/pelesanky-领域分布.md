
```mermaid
---
config:
  sankey:
    height: 200
    nodeWidth: 16
    nodePadding: 0
---
sankey-beta

${canvasBacklinkRows(
  "Documents/I.P.A.R.A/工作领域/归档",
  "Documents/I.P.A.R.A/学习领域/归档",
  "Documents/I.P.A.R.A/生活领域/归档",
  groupByFolder("工作领域", "学习领域", "生活领域"),
  sourceLabel("领域")
)}

```

