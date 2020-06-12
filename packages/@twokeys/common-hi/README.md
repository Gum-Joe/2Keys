# @twokeys/common-hi
Encompasses things shared by the GUI and CLI, such as interfaces defining Setup UI, as well as the code for these.

File structure:
```
src
|- common
   |- base-command.ts (abstract class which define a constructor and a run() method to implement. Will probably take a 2Keys object?)
|- setup
   |- common
      |- commands
         |- install.ts
      |- interfaces.ts (maybe split into separate files?)
   |- oobe
      |- commands
         |- create-config.ts
      |- layouts
         |- welcome.ts
   |- same as oobe folder for setup-(detector, project, add-detector, keyboard) 
|- each command then has it's won folder, e.g.:
|- sync (detector config syncing code)
```