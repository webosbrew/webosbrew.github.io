# webosbrew.github.io

webOS Brew Community Development, Hacking & Reverse-Engineering Documentation.

## Usage
This repo is published on: [https://webosbrew.org](https://webosbrew.org)

## Development
This page is built using [Pelican](https://blog.getpelican.com/). Pelican is
based on Python and all dependencies of our project can be installed using pip:

```sh
# Create virtual environment
python3 -m venv venv/

# Enter the environment
. venv/bin/activate

# Install dependencies.
pip3 install -r requirements.txt
```

In order to then serve the page with autoreload use this:
```sh
pelican content -l -r
```
