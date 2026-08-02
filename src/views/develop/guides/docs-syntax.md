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

### Stub Notice

`{{> stub }}` puts the "this page is a stub" panel on the page. Put it after the first
paragraph. Remove it once the page is no longer a stub.

### Heading Anchors

A heading gets its anchor from its own text, so editing the text moves the anchor and any
link to it stops working. Pin one with `{#...}`:

```markdown
## 4. Honour the Licence {#honour-the-licence}
```

The heading renders as `4. Honour the Licence` and the anchor stays `#honour-the-licence`,
whatever the wording or the number becomes later. Worth doing on numbered headings, where
inserting one section renumbers every anchor after it.

A heading that starts with a digit gets a `section-` prefix, because a CSS selector cannot
start with one and Bootstrap scrollspy passes the id straight to `querySelector`. So
`## 4. Honour the Licence` answers to `#section-4-honour-the-licence`. An explicit anchor
avoids that too.

Write the heading as markdown either way. Raw `<h2 id="...">` keeps the id, but the
sectioning runs on markdown and never sees it, so the section above swallows everything
under that heading and scrollspy points at the wrong one.

### Alerts

A blockquote that starts with an alert marker becomes a coloured callout, the same way it
does on GitHub:

```markdown Markdown
> [!WARNING]
> Do not link the system OpenSSL. It crosses four SONAMEs between webOS 1 and webOS 11.
```

> [!WARNING]
> Do not link the system OpenSSL. It crosses four SONAMEs between webOS 1 and webOS 11.

`NOTE`, `TIP`, `IMPORTANT`, `WARNING` and `CAUTION` are all available, and the marker is
not case sensitive. Keep `WARNING` and `CAUTION` for the ones that cost hardware.

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

### Previous and Next Links

End a document with a list of `Previous` and `Next` entries to get the paired navigation
cards at the foot of the page:

```markdown Markdown
* Previous
    * [Environment Setup](/develop/guides/env-setup)
* Next
    * [Developing Web App](/develop/guides/web-app)
    * [Developing Native App](/develop/guides/native-app)
```

Both keys are optional, and either one can hold more than one link, for a page that leads
to a choice rather than to a single next step.

The list has to be the last thing in the document. Put anything after it, even one
paragraph, and it stays an ordinary bullet list. Write it this way rather than as a
`Next: ...` sentence, which renders but does not match the rest of the site.

### Tables and Images

Both are handled for you, so write them the plain markdown way.

A table is wrapped in a scrolling container. A wide one scrolls inside itself rather than
pushing the page sideways, which matters on a phone: a page wider than the screen takes the
fixed chrome off screen with it.

An image gets `img-fluid rounded-3`, so it shrinks to fit and never overflows.

## Sidebar Navigation

For directories that contain multiple documents, you can create a sidebar for better navigation.

To create a sidebar, create a file named `_sidebar.md` in the directory. The sidebar file should
contain a list of links to documents in the directory.