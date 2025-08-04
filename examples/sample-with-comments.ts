/**
 * Sample GAS functions with comments for testing
 * このファイルはコメント保持のテスト用です
 */
/** biome-ignore-all lint/correctness/noUnusedVariables: この関数はサンプルであり、実際の使用ではありません */

/**
 * スプレッドシートが開かれたときに実行される関数
 * @param {Event} _e - イベントオブジェクト
 */
function onOpen(_e) {
	// メニューを追加
	const ui = SpreadsheetApp.getUi()

	/*
	 * カスタムメニューの作成
	 * ユーザーが簡単にアクセスできるようにする
	 */
	ui.createMenu('カスタムメニュー')
		.addItem('データ処理', 'processData')
		.addSeparator()
		.addItem('設定', 'showSettings')
		.addToUi()

	// ログに記録
	console.log('スプレッドシートが開かれました')
}

/**
 * データを処理する関数
 * @returns {void}
 */
function processData() {
	/**
	 * TODO: 実際の処理を実装する
	 * 1. データの取得
	 * 2. データの加工
	 * 3. 結果の出力
	 */

	// 現在のスプレッドシートを取得
	const sheet = SpreadsheetApp.getActiveSheet()

	/* データ範囲を指定 */
	const range = sheet.getRange('A1:C10')
	const values = range.getValues()

	// 処理結果をログに出力
	console.log('処理したデータ:', values.length, '行')
	console.warn('注意: これはサンプルコードです')
}
