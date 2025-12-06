/*
 * ファイル: hidden_field.js
 * 説明: レコード詳細画面で不必要なフィールドを非表示(DOM要素削除)
 * 実装の概要:
 *   - kviewer.events.on("record.show", ...) でレコード表示時に実行
 *   - 各フィールドは `data-field-code` 属性で識別し、該当要素を削除する
 * 作成者: fujimakiaya
 * 作成日: 2025-12-06
 * version: v1.01
 */

// *** kViewer event - record.show ***
kviewer.events.on("record.show", function (state) {
  const fieldsToRemove = [
    "アプリ番号",
    "フィールドコード_担当者メールアドレス_to_",
    "フィールドコード_従業員_姓_",
    "フィールドコード_従業員_名_",
    "フィールドコード_送信日_",
    "フィールドコード_担当者メールアドレス_cc_",
    "URL",
  ];

  fieldsToRemove.forEach((code) => {
    document
      .querySelectorAll(`div[data-field-code="${code}"]`)
      .forEach((el) => el.remove());
  });
});
