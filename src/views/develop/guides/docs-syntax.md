# Document Syntax

How to write documents for this site

## Code Blocks

### Tabbed Code Blocks

Inspired by syntax of [readme.com](https://docs.readme.com/rdmd/docs/code-blocks), you can create tabbed code blocks
by using the following syntax:

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