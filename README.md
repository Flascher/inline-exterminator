# Inline Exterminator

**`NOTE`**: This tool is in active development may not be as stable as we'd like.
Currently the basic functionality is there, but there are likely still quite a few bugs.
If you intend to use this in its current state, **make sure you keep backups of all files you're
operating on, or that they're already in some form of version control**. We're not responsible for
any botched files that may come out of this script!

## Purpose

This command line tool was written to help clean up legacy web code.

Currently you specify a `.html`, `.jsp`, `.asp`, `.php` or other similar type of file and this script
will go through the file and remove inline style attributes, and style tags and move their styles
to a `.css` file. The input file will have its style attributes replaced with classes, and the style
tags will be moved to the output `.css` file. Any inline styles that are used multiple times will be
condensed down to one class.

## Installation

`npm install -g https://github.com/Flascher/inline-exterminator.git`

Although this repo is installable as an npm package, its currently only located on this repo, and not
in any npm repositories.

## CLI Options

Once installed globally with npm, this script can be called via `inline-exterminator` or its alias
`inlex`.

| Flag name           | Description                                  | Flag type   |
|---------------------|----------------------------------------------|-------------|
| `--src`             | The file(s) to run on                        | String[]    |
| `--directory`, `-d` | The directory to run on (attempts all files) | String      |
| `--recursive`, `-r` | Attempt to run on subdirectories?            | Boolean     |
| `--filetype`, `-t`  | File extensions to run on (`*.html`, `*.php`)| String      |
| `--no-replace`, `-n`| Input file will not be overwritten, instead a new file will be created with the string passed to the flag (see example below) | String |
| `--output`, `-o`    | Name of file to put extracted css in         | String      |
| `--help`, `-h`      | Displays help text similar to this readme    | Boolean     |

## Examples

### Basic Usage

`inlex example.html -o example.css`

This will result in `example.html` having any inline style tags or attributes removed and replaced
with classes that have been placed in `example.css`.

### No-replace Flag

`inlex example.html -o example.css -n cleaned`

This will result in nearly the same output as the basic example, but `example.html` will not be
overwritten, and instead it will output both `example.css` and `example.cleaned.html`.

### Directory Flag

`inlex -d my-dirty-html -o example.css`

This will run the script on *every* file in `./my-dirty-html`. Usually you'll want to use the filetype
flag to limit what files inline-exterminator actually runs on.

### Filetype Flag

`inlex -d my-dirty-html -t *.html -o example.css`

This will run the script on all `.html` files inside the `./my-dirty-html` directory. `example.css`
will be output in the directory you're running the script from.

### Recursive Flag

`inlex -d my-dirty-html -r -o example.css`

This will run the script on *every* file in`./my-dirty-html` and *all* of its subdirectories. Again,
you'll likely want to use the Filetype flag to limit the files this runs on.

## Todos

* Add more ignore cases for server-side style tags as they come up (i.e. Razor syntax, handlebars, etc)