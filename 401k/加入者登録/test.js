function allScriptsLoaded(state) {
  const fieldcode_obj = {
    //FBフィールドコード
    zip: "郵便番号",
    state: "住所1",
    city: "住所2",
    addressLine: "住所2",
    city_ruby: "住所2カナ",
    addressLine_ruby: "住所2カナ",
  };
  autoZipAddress(fieldcode_obj);

  return state;
}

fb.events.form.mounted.push(function (state) {
  // すべてのスクリプトがロードされた後にallScriptsLoaded関数を実行
  allScriptsLoaded(state); // stateを引き継ぐ
});
