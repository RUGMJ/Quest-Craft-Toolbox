# Quest Craft Toolbox

> Made by RUGMJ

A simple tool to help make setting up Quest Craft easier

## Running from the releases tab

- 1: Download the zip from the releases tab
- 2: Extract the zip to your documents folder
- 3: Open the folder you just unzipped

## How to use

- First plug your Quest into your pc
  Make sure there are no other android devices plugged into your pc
- Run the .exe

### Removing the tutorial popup

- After following previous steps
- Simply using arrow keys select the "Remove Tutorial Popup" option and press enter
- Then unplug your quest and open QuestCraft the popup should be gone!

### Editing your server list

- After following previous steps
- Simply using arrow keys select the "Edit Server List" option and press enter
- Then if you have existing servers it will ask you if you want to add a new server or delete an exisiting one select which applies to you
- If you dont have exisiting servers then it will immediately take you to adding one, simply fill out the form and press enter
- After you've finished you can unplug your quest and open QuesrCraft your servers should now be updated

## (For Advanced Users) Building, Running and Bundling from source

> Only continue if you know what you're doing

- Install nodejs 16 to your machine

- clone the repository to your machine
- cd into the directory
- run `npm install` this will install the dependencies
- then to build the project run `npm run build`
- if you wish to run it now, run `node index.js`
- if instead you wish to bundle it to an executeable run the following
- `npm run rollup` to convert the project to system instead of esm
- then run `npm run bundle` to bundle the bundle.js to a executeable
