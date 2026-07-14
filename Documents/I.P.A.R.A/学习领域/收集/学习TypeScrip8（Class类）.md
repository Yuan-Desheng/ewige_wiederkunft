---
createTime: 2026-06-29 19:00
笔记ID: 2026062919000921
multiFile:
multiMedia:
description: 小满 TypeScript 教程「学习TypeScrip8（Class类）」笔记。素材来源 CSDN 博客 122342425。
笔记类型: 收集笔记
阐述日期:
tags:
  - TypeScript
  - 前端
  - 学习笔记
aliases:
cssclasses:
卡片盒笔记主题:
  - "[[Documents/I.P.A.R.A/学习领域/归档/卡片盒笔记主题索引卡/小满zs-typescript.canvas|小满zs-typescript]]"
---

## 学习TypeScrip8（Class类）

```meta-bind-embed
[[笔记抬头模块]]
```

<progress value="20" max="100"></progress>

> 素材来源：[CSDN 博客](https://xiaoman.blog.csdn.net/article/details/122342425)
> 作者：小满 zsxlfn（专栏分类：typescript）
> 发布日期：2022-01-06 14:55:08

---

ES6提供了更接近传统语言的写法，引入了Class（类）这个概念，作为对象的模板。通过`class`关键字，可以定义类。基本上，ES6的`class`可以看作只是一个语法糖，它的绝大部分功能，ES5都可以做到，新的`class`写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。上面的代码用ES6的“类”改写，就是下面这样。



```typescript
//定义类
class Person {
    constructor () {

    }
    run () {

    }
}
```



## 1.ok！那我们在TS 是如何定义类的如下图





在TypeScript是不允许直接在constructor 定义变量的 需要在constructor上面先声明





这样引发了第二个问题你如果了定义了变量不用 也会报错 通常是给个默认值 或者 进行赋值





 恭喜你已经学会了在class中 如何定义变量



## 2.类的修饰符



### 总共有三个 public private protected





使用public 修饰符 可以让你定义的变量 内部访问 也可以外部访问 如果不写默认就是public



使用  private 修饰符 代表定义的变量私有的只能在内部访问 不能在外部访问





  使用  protected 修饰符 代表定义的变量私有的只能在内部和继承的子类中访问 不能在外部访问



TIPS:代码



```typescript
class Person {
    public name:string
    private age:number
    protected some:any
    constructor (name:string,ages:number,some:any) {
       this.name = name
       this.age = ages
       this.some = some
    }
    run () {

    }
}

class Man extends Person{
    constructor () {
        super("张三",18,1)
        console.log(this.some)
    }
    create () {
       console.log(this.some)
    }
}
let xiaoman = new Person('小满',18,1)
let man = new Man()
man.some
```



## 3. static 静态属性 和 静态方法





我们用static 定义的属性 不可以通过this 去访问 只能通过类名去调用





static 静态函数 同样也是不能通过this 去调用 也是通过类名去调用





需注意： 如果两个函数都是static 静态的是可以通过this互相调用





## 4.interface 定义 类





 ts interface 定义类 使用关键字 implements   后面跟interface的名字多个用逗号隔开 继承还是用extends





```typescript
interface PersonClass {
    get(type: boolean): boolean
}

interface PersonClass2{
    set():void,
    asd:string
}

class A {
    name: string
    constructor() {
        this.name = "123"
    }
}

class Person extends A implements PersonClass,PersonClass2 {
    asd: string
    constructor() {
        super()
        this.asd = '123'
    }
    get(type:boolean) {
        return type
    }
    set () {

    }
}
```



## 5.抽象类



应用场景如果你写的类实例化之后毫无用处此时我可以把他定义为抽象类



或者你也可以把他作为一个基类-> 通过继承一个派生类去实现基类的一些方法



我们看例子



下面这段代码会报错抽象类无法被实例化



```typescript
abstract class A {
   public name:string

}

new A()
```



例子2



我们在A类定义了 getName 抽象方法但为实现



我们B类实现了A定义的抽象方法 如不实现就不报错 **我们定义的抽象方法必须在派生类实现**



```typescript
abstract class A {
   name: string
   constructor(name: string) {
      this.name = name;
   }
   print(): string {
      return this.name
   }

   abstract getName(): string
}

class B extends A {
   constructor() {
      super('小满')
   }
   getName(): string {
      return this.name
   }
}

let b = new B();

console.log(b.getName());
```



视频案例



```typescript
//1. class 的基本用法 继承 和 类型约束
//2. class 的修饰符 readonly  private protected public
//3. super 原理
//4. 静态方法
//5. get set
interface Options {
    el: string | HTMLElement
}

interface VueCls {
    init(): void
    options: Options
}

interface Vnode {
    tag: string
    text?: string
    props?: {
        id?: number | string
        key?: number | string | object
    }
    children?: Vnode[]
}

class Dom {
    constructor() {

    }

    private createElement(el: string): HTMLElement {
        return document.createElement(el)
    }

    protected setText(el: Element, text: string | null) {
        el.textContent = text;
    }

    protected render(createElement: Vnode): HTMLElement {
        const el = this.createElement(createElement.tag)
        if (createElement.children && Array.isArray(createElement.children)) {
            createElement.children.forEach(item => {
                const child = this.render(item)
                this.setText(child, item.text ?? null)
                el.appendChild(child)
            })
        } else {
            this.setText(el, createElement.text ?? null)
        }
        return el;
    }
}

class Vue extends Dom implements VueCls {
    options: Options
    constructor(options: Options) {
        super()
        this.options = options;
        this.init()
    }

   static version () {
      return '1.0.0'
   }

   public init() {
        let app = typeof this.options.el == 'string' ? document.querySelector(this.options.el) : this.options.el;
        let data: Vnode = {
            tag: "div",
            props: {
                id: 1,
                key: 1
            },
            children: [
                {
                    tag: "div",
                    text: "子集1",
                },
                {
                    tag: "div",
                    text: "子集2"
                }
            ]
        }
        app?.appendChild(this.render(data))
        console.log(app);

        this.mount(app as Element)
    }

   public mount(app: Element) {
        document.body.append(app)
    }
}

const v = new Vue({
    el: "#app"
})
```





[学习TypeScrip9（元组类型）_qq1195566313的博客-CSDN博客](https://blog.csdn.net/qq1195566313/article/details/122353137?spm=1001.2014.3001.5501)
