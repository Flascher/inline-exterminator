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

## Non-standard Tag Handling

When a non-standard tag is encountered `inlex` prompts you to tell it how that tag should be structured.
This is done to help preserve any server side functionality that might be included with a `.jsp`,
`.php`, `.asp` file (or something similar).

### Why?

Unfortunately there are no good options for HTML parsers (that I've found) that are both lenient
enough with the HTML spec and that make note of what the closing tag is (as in strict HTML you should
always be able to infer this from the name of the tag). So unfortunately, to make sure the output 
has the smallest negative impact on the code possible, some manual input for non-standard tags is
required.

A few common examples, starting with how they look before `inlex` modifies them, the prmopt you're given,
and how you should answer follow:

### Code tags

These tags don't have any form of closing tag. In most cases these are server side tags that indicate
that the server side code inbetween the left and right tags should be run, and not just be HTML. Some
examples include `<?php ... ?>` in PHP, and `<% ... %>` in JSP/ASP Classic. There are other examples
that aren't code tags as well, but this example should suffice for any server side elements that are
void or self-closing.

#### Before

`<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859"%>`

#### Prompt

`file.jsp:12   | <%@ : `

#### Answer

`(enter)`

Providing no input and hitting enter/return will get you the same output after `inlex` has modified
the HTML.

### Standard-style tags

These tags are structured like typical HTML elements, but their names are not recognized by the HTML
spec.

#### Before

`<c:import url="Video_51_header.jsp"> ... </c:import>`

#### Prompt

`file.jsp:36   | <c:import : `

#### Answer

`</[name]>`

When asking for the closing tag, you can use `[name]` and that will be replaced with the name of the
tag itself (in this case `[name] = c:import`). The result would make the closing tag `</c:import>`.

### Void tags

#### Before

`<sql:setDataSource var="bunny" dataSource="jdbc/vid_53" />`

#### Prompt

`file.jsp:44   | <sql:setDataSource : `

#### Answer

`[void]`

`[void]` is another special token you can use to tell `inlex` that the tag should be self closing
in the same style as typical HTML. Specifying `[void]` in this case results in the output being
the same as it was before parsing the file. Using no input like a code tag would result in
`<sql:setDataSource var="bunny" dataSource="jdbc/vid_53">` without the self-closing `/>`.

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