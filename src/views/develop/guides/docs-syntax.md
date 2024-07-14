# Document Syntax

How to write documents for this site.

## Markdown Syntax

We use GitHub Flavored Markdown (GFM) for writing documents. You can find a guide on how to write
GFM [here](https://guides.github.com/features/mastering-markdown/).

Additionally, we use the following syntax for writing documents:

### Automatic Lead Text

The first paragraph of a document will be used as
the [lead text](https://getbootstrap.com/docs/5.3/content/typography/#lead).

To avoid this behavior, you can insert an HTML comment (e.g. <code class="text-nowrap">&lt;!-- no-lead --&gt;</code>) or
a horizontal rule (`---`) before the first paragraph.

### Bootstrap Icons

Use `:bi-icon-name:` to insert a Bootstrap icon. For example, `:bi-book:` will become :bi-book:.

### Tabbed Code Blocks

Inspired by syntax of [readme.com](https://docs.readme.com/rdmd/docs/code-blocks), you can create code blocks
with the following syntax:

````markdown Markdown
```javascript JavaScript
function hello() {
  console.log('Hello, World!');
}

hello();
```

```python Python
def hello():
  print('Hello, World!')
  
hello()
```

...
````

To get tabbed code blocks like this:

```javascript JavaScript
function hello() {
  console.log('Hello, World!');
}

hello();
```

```python Python
def hello():
  print('Hello, World!')
  
hello()
```

```bash Shell
echo "Hello, World!"
```

```rust Rust
fn main() {
  println!("Hello, World!");
}
```

```c C
#include <stdio.h>

int main() {
  printf("Hello, World!\n");
  return 0;
}
```

```csharp C#
using System;

class Program
{
  static void Main()
  {
    Console.WriteLine("Hello, World!");
  }
}
```

```java Java
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
```

## Sidebar Navigation

For directories that contain multiple documents, you can create a sidebar for better navigation.

To create a sidebar, create a file named `_sidebar.md` in the directory. The sidebar file should
contain a list of links to documents in the directory.