const fs = require("node:fs");
const path = require("node:path");

class CheckinStore {
  constructor(filePath = ".study-log.json") {
    this.filePath = path.resolve(filePath);
  }

  read() {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }

    const raw = fs.readFileSync(this.filePath, "utf8").trim();
    if (!raw) {
      return [];
    }

    let entries;
    try {
      entries = JSON.parse(raw);
    } catch {
      throw new Error("学习记录文件不是有效的 JSON：" + this.filePath);
    }

    if (!Array.isArray(entries) || entries.some((entry) => !this.#isEntry(entry))) {
      throw new Error("学习记录文件格式不正确。");
    }

    return entries;
  }

  add(note, date = new Date()) {
    const cleanNote = String(note ?? "").trim();
    if (!cleanNote) {
      throw new Error("学习内容不能为空。");
    }

    const entries = this.read();
    const entry = {
      id: entries.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      date: this.#formatDate(date),
      note: cleanNote,
    };

    entries.push(entry);
    this.#write(entries);
    return entry;
  }

  list() {
    return this.read().sort((left, right) => right.id - left.id);
  }

  remove(entryId) {
    const id = Number(entryId);
    if (!Number.isInteger(id) || id < 1) {
      throw new Error("学习记录 ID 必须是正整数。");
    }

    const entries = this.read();
    const index = entries.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error("找不到学习记录 #" + id + "。");
    }

    const [removed] = entries.splice(index, 1);
    this.#write(entries);
    return removed;
  }

  #formatDate(date) {
    const value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) {
      throw new Error("日期格式不正确。");
    }

    return value.toISOString().slice(0, 10);
  }

  #write(entries) {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(entries, null, 2) + "\n", "utf8");
  }

  #isEntry(entry) {
    return (
      entry &&
      Number.isInteger(entry.id) &&
      typeof entry.date === "string" &&
      typeof entry.note === "string"
    );
  }
}

module.exports = { CheckinStore };
