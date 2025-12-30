
``````ad-review
title: KISS复盘模块
color: 33,146,61
`````col
````col-md
flexGrow=1
===
<center>🟢Keep(保持)</center>

```dataview
list WITHOUT ID
link(file.link,keep) From "Documents/Dailynote" 
WHERE contains(Keep, "") and file.frontmatter.Keep != ""
```

````
````col-md
flexGrow=1
===
<center>🟡Improve（改进）</center>

```dataview
list WITHOUT ID
link(file.link,Improve) From "Documents/Dailynote"
WHERE contains(Improve, "") and file.frontmatter.Improve != ""
```

````

````col-md
flexGrow=1
===
<center>🔴Stop（停止）</center>

```dataview
list WITHOUT ID
link(file.link,Stop)  From "Documents/Dailynote"
WHERE contains(Stop, "") and file.frontmatter.Stop != ""
```


````

````col-md
flexGrow=1
===
<center>🔵Start（开始）</center>

```dataview
list WITHOUT ID
link(file.link,Start)  From "Documents/Dailynote"
WHERE contains(Start, "") and file.frontmatter.Start != ""
```

````

``````





