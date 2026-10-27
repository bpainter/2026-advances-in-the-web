$ npm -v
12.1.0
$ npm install sharp
npm warn skipped install scripts for sharp
npm warn   (allowScripts is off)
added 23 packages in 2s
$ npm approve-scripts --allow-scripts-pending
approved: sharp
$ cat package.json
{
  "allowScripts": { "sharp": true }
}
$ npm install
> sharp@0.34.x install
added 23 packages in 4s
