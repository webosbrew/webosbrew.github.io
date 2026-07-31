# Publishing

Getting an app into the [homebrew app repository](https://repo.webosbrew.org/).

{{> stub }}

You made an app, and you want other people to have it. Handing out the IPK yourself already
works, from a GitHub release or anywhere else. Getting it listed in Homebrew Channel is the
extra step, and that is what these pages cover.

The repository stores a pointer, not your IPK. You host the release, one small YAML file in
[apps-repo](https://github.com/webosbrew/apps-repo) points at it, and merging that file is
what puts your app in front of users.

* **[Rules](/develop/guides/publishing/rules)** — read these first. A submission that
  breaks one gets rejected whatever else is right.
* **[How to Submit](/develop/guides/publishing/how-to)** — host the release, write the
  package file, check it, open the pull request.

Not there yet? The [Getting Started](/develop/guides) guides cover setting up and building,
and [Development Workflow](/develop/guides/workflow) shows where publishing sits in the
whole process.

* Next
    * [Rules](/develop/guides/publishing/rules)
