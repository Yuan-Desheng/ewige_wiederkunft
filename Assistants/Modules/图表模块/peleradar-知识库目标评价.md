
```mermaid
---
config:
  radar:
    height: 200
---
radar-beta
  title 知识库目标评价
  axis reading["阅读"], writing["人脉圈"], coding["日记"], speaking["永久笔记"]
  curve current["当前评分"]{${folder("Books/白板笔记").files}, ${folder("Connections/人物").files}, ${folder("Documents/Dailynote").files}, ${propertyCount("笔记类型", "永久笔记")}}
  curve target["目标"]{500, 500, 500, 500}
  max 500
  min 0
```
