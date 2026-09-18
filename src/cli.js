#!/usr/bin/env node

const { CheckinStore } = require("./checkin-store");

function printHelp(output = console.log) {
  output(
      "用法：\n" +
      "  npm start -- add <学习内容>   添加一条学习记录\n" +
      "  npm start -- list             查看学习记录\n" +
      "  npm start -- remove <记录 ID> 删除一条学习记录\n" +
      "  npm start -- help             显示帮助\n"
  );
}

function main(args = process.argv.slice(2), env = process.env) {
  const [command, ...rest] = args;
  const store = new CheckinStore(env.STUDY_LOG_FILE || ".study-log.json");

  try {
    if (!command || command === "help" || command === "--help" || command === "-h") {
      printHelp();
      return 0;
    }

    if (command === "add") {
      const entry = store.add(rest.join(" "));
      console.log("已记录：" + entry.date + " #" + entry.id + " " + entry.note);
      return 0;
    }

    if (command === "list") {
      const entries = store.list();
      if (entries.length === 0) {
        console.log("暂无学习记录。");
        return 0;
      }

      entries.forEach((entry) => {
        console.log(entry.date + " #" + entry.id + " " + entry.note);
      });
      return 0;
    }

    if (command === "remove") {
      const entry = store.remove(rest[0]);
      console.log("已删除：" + entry.date + " #" + entry.id + " " + entry.note);
      return 0;
    }

    console.error("未知命令：" + command);
    printHelp(console.error);
    return 1;
  } catch (error) {
    console.error("错误：" + error.message);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = { main };
