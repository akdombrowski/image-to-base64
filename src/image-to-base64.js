import { Command } from "commander";
import {
  accessSync,
  constants,
  writeFileSync,
  readFileSync,
  realpathSync,
  existsSync,
  openSync,
  close,
  mkdirSync,
} from "node:fs";

// create local instance of Command
const program = new Command();
const convertImgToBase64 = (localImageFilePath, options) => {
  try {
    const path = realpathSync(localImageFilePath);
    // read in file, turns it into a Buffer
    const imageBuf = readFileSync(path);
    //  convert buffer to base64
    const imageBase64 = imageBuf.toString("base64");

    const outputFile = options.outputFile;
    if (outputFile) {
      let outputFileFD;
      try {
        // outputFile file descriptor
        outputFileFD = openSync(outputFile, "w+");
        checkAccessPermissions(path, outputFile);
        existsSync(outputFile);
        writeFileSync(outputFileFD, imageBase64);
        console.log("wrote base64 data to file: ");
        console.log(outputFile);
      } catch (error) {
        if (error.code === "ENOENT") {
          console.log("error");
          console.log(error);
          try {
            const outputFileTrimmed = outputFile.trim();
            console.log("try to create the dir");
            let dirPath = outputFileTrimmed;
            if (
              outputFileTrimmed.charAt(outputFileTrimmed.length - 1) !== "/"
            ) {
              const indexOfLastForwardSlash =
                outputFileTrimmed.lastIndexOf("/");
              dirPath = outputFileTrimmed.slice(0, indexOfLastForwardSlash);
            }
            mkdirSync(dirPath);
            console.log("dir created:");
            console.log(dirPath);
          } catch (error) {
            console.log();
            console.log("couldn't make the dir");
            console.log();
            console.log("error");
            console.log(error);
            console.log();
          }

          console.log();

          console.log(
            "make sure the directory exists where you want to create the output file"
          );
          console.log();
        } else {
          console.log();
          console.log(error);
          console.log("Error trying to write to output file:");
          console.log(outputFile);
          console.log();
        }
      } finally {
        if (outputFileFD) {
          close(outputFileFD);
        }
      }
    } else {
      console.log(imageBase64);
    }
  } catch (err) {
    // handle the error
    console.log(err);
  }
};

const checkAccessPermissions = (path, outputFilePath) => {
  // check if we can read the local image file
  accessSync(path, constants.R_OK);

  // if supplied, check that we can write to the output file
  if (outputFilePath) {
    accessSync(outputFilePath, constants.W_OK);
  }
};

program
  .name("image-to-base64")
  .description("CLI to convert an image into base64")
  .version("0.0.1");

program
  .command("convert")
  .description("Convert an image into base64")
  .argument("<string>", "path to local image file or a url")
  .option("-o, --output-file <string>", "specify a file to output bae64 to")
  .option("-f, --image-format <string>", "The format the image is stored as.")
  .option("-b, --batch <string...>", "batch process multiple files")
  .action((str, options) => convertImgToBase64(str, options));

program
  .command("join")
  .description("Join the command-arguments into a single string")
  .argument("<strings...>", "one or more strings")
  .option("-s, --separator <char>", "separator character", ",")
  .action((strings, options) => {
    console.log(strings.join(options.separator));
  });

program.parse();

// Try the following:
//    node src/index.js /mnt/a/akdfl/A_Documents/DV/PrettierFlowPreviewPresentation/anthonyShoutingCropped2_1.png
//    node string-util
//    node string-util help split
//    node string-util split --separator=/ a/b/c
//    node string-util split --first a,b,c
//    node string-util join a b c d
