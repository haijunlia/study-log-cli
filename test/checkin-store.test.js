const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { CheckinStore } = require("../src/checkin-store");

function createStore() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "study-log-cli-"));
  return new CheckinStore(path.join(directory, "study-log.json"));
}

test("添加学习记录并持久化", () => {
  const store = createStore();

  const entry = store.add("学习 SSH 推送", new Date("2026-09-18T00:00:00Z"));

  assert.equal(entry.id, 1);
  assert.equal(entry.date, "2026-09-18");
  assert.equal(store.read()[0].note, "学习 SSH 推送");
});

test("记录按 ID 从新到旧排列", () => {
  const store = createStore();
  store.add("第一次学习");
  store.add("第二次学习");

  assert.deepEqual(store.list().map((entry) => entry.id), [2, 1]);
});

test("可以按关键词搜索学习记录", () => {
  const store = createStore();
  store.add("学习 GitHub Actions");
  store.add("学习 Docker");
  store.add("复习 GitHub SSH");

  assert.deepEqual(
    store.search("github").map((entry) => entry.note),
    ["复习 GitHub SSH", "学习 GitHub Actions"]
  );
});

test("空搜索关键词会被拒绝", () => {
  const store = createStore();

  assert.throws(() => store.search("   "), /搜索关键词不能为空/);
});

test("可以删除指定学习记录", () => {
  const store = createStore();
  store.add("保留的记录");
  store.add("需要删除的记录");

  const removed = store.remove(2);

  assert.equal(removed.note, "需要删除的记录");
  assert.deepEqual(store.list().map((entry) => entry.id), [1]);
  assert.throws(() => store.remove(2), /找不到学习记录/);
});

test("空内容会被拒绝", () => {
  const store = createStore();

  assert.throws(() => store.add("   "), /学习内容不能为空/);
});

test("非法日期会被拒绝", () => {
  const store = createStore();

  assert.throws(() => store.add("测试日期", "not-a-date"), /日期格式不正确/);
});
