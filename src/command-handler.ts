import { MacroTextProvider } from "./macro-text-provider";
import { CommandHandler, ExpandedDocument, ExpandedDocumentIdentifier } from "./types";
import {
  extensionScheme,
  validateCommand,
  validateCommandInput,
  validateCustomCommand,
  validateDocument,
  validateModPath,
  validatePathInput,
} from "./command-validator";

/** Base cargo-expand command */
const cargoComand = "cargo expand";
/** Available extension commands */
const commands = {
  expand: "rust-macro-expand.expand",
  expandCrate: "rust-macro-expand.expand-crate",
  expandReload: "rust-macro-expand.expand-reload",
  expandCommand: "rust-macro-expand.expand-command",
  expandPath: "rust-macro-expand.expand-path",
};

/** Macro text provider instance */
export const macroTextProvider = new MacroTextProvider();

/**
 * Command handler for {@link commands.expand} command
 *
 * Expand macros in the current file. Tries to find the module in which the current file resides and expands the macros
 * in it. If it doesn't exist defaults to crate expand.
 */
export const expandHandler: CommandHandler = {
  commandName: commands.expand,
  command: async () => {
    const validation = await validateCommand();
    if (validation) {
      const mod = await validateModPath(validation);
      await macroTextProvider.expand(
        new ExpandedDocument(
          validation.cargoPath,
          `${cargoComand} ${mod}`,
          validation.uri,
          validation.fileName
        )
      );
    }
  },
};

/**
 * Command handler for {@link commands.expandCrate} command
 *
 * Expand macros in the current crate. Determines which crate it is by
 * searching for the Cargo.toml file in the directory structure of the current file.
 */
export const expandCrateHandler: CommandHandler = {
  commandName: commands.expandCrate,
  command: async () => {
    const validation = await validateCommand(true);
    if (validation) {
      await macroTextProvider.expand(
        new ExpandedDocument(
          validation.cargoPath,
          cargoComand,
          validation.uri,
          validation.fileName,
          true
        )
      );
    }
  },
};

/**
 * Command handler for {@link commands.expandReload} command
 *
 * Reload expand in already expanded file. Will use the same command and path as the original command.
 */
export const expandReloadHandler: CommandHandler = {
  commandName: commands.expandReload,
  command: async () => {
    const validatedDoc = validateDocument({ checkScheme: extensionScheme });
    if (validatedDoc) {
      await macroTextProvider.expand(new ExpandedDocumentIdentifier(validatedDoc.uri));
    }
  },
};

/**
 * Command handler for {@link commands.expandCommand} command
 *
 * Enables passing any valid command to cargo-expand. Check the cargo-expand docs for valid commands.
 * */
export const expandCommandHandler: CommandHandler = {
  commandName: commands.expandCommand,
  command: async () => {
    const command = await validateCommandInput();
    if (command) {
      const validation = await validateCustomCommand({ command: command });
      if (validation) {
        await macroTextProvider.expand(
          new ExpandedDocument(validation.path, command, validation.uri, validation.fileName, true)
        );
      }
    }
  },
};

/**
 * Command handler for {@link commands.expandPath} command
 *
 * Enables passing any valid command to cargo-expand, as well as the absolute system path
 * in which the command will be executed. Check the cargo-expand docs for valid commands.
 * */
export const expandPathHandler: CommandHandler = {
  commandName: commands.expandPath,
  command: async () => {
    const command = await validateCommandInput();
    if (command) {
      const path = await validatePathInput();
      if (path) {
        const validation = await validateCustomCommand({
          command: command,
          path: path,
        });
        if (validation) {
          await macroTextProvider.expand(
            new ExpandedDocument(
              validation.path,
              command,
              validation.uri,
              validation.fileName,
              true
            )
          );
        }
      }
    }
  },
};
