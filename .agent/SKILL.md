# Timeline App Design System

このドキュメントはTimelineアプリのデザインシステムを定義します。新しいコンポーネントを追加する際は、このガイドラインに従ってください。

---

## カラーパレット

### 背景色
| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--c-base-background` | `#1c1c1f` | メイン背景 |
| `--c-base-background-lighter` | `#292c34` | カード、年バッジ |
| `--c-base-background-card` | `#24262b` | サイドバー、パネル |

### テキスト色
| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--c-base-text` | `#fff` | メインテキスト |
| `--c-gray` | `rgba(214, 226, 243, 0.7)` | セカンダリテキスト、ラベル |

### アクセントカラー
| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--c-accent-primary` | `#3BA9FF` | Zenn Blue - リンク、ボタン、ハイライト |
| `--c-accent-danger` | `#ef4444` | 削除、警告 |

### ボーダー
| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--c-border` | `rgba(115, 125, 130, 0.4)` | すべてのボーダー |

---

## タイポグラフィ

### フォントファミリー
```scss
--font-family-base: 'Zen Maru Gothic', 'Helvetica Neue', Arial, 
  'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
```

### フォントサイズ
| 用途 | サイズ |
|------|--------|
| ページタイトル | `2.7rem` |
| 説明文 | `1.1rem` |
| アイテムタイトル | `1.15rem` |
| メタ情報 | `0.9rem` |
| ラベル | `0.75rem` |
| ボタン | `0.875rem` |

---

## レイアウト

### コンテンツエリア
- 最大幅: `680px`
- 左右パディング: `1.2rem`
- 中央寄せ: `margin: 0 auto`

### サイドバー
- 幅: `420px`（スマホは100%）
- 背景: `--c-base-background`
- 左ボーダー: `1px solid var(--c-border)`

---

## デザイン原則

### ✅ DO（推奨）
- フラットなデザインを使用
- ボーダーは `1px solid var(--c-border)` で統一
- 角丸は控えめに（`0.375rem` 〜 `0.75rem`）
- トランジションは `0.15s ease` で統一
- スクロールバーは目立たないように

### ❌ DON'T（禁止）
- **グラデーションは使わない**
- **シャドウ（box-shadow）は使わない**
- 派手なアニメーションは避ける
- 複数のアクセントカラーを混ぜない

---

## タイムラインコンポーネント

### 年バッジ
```scss
.year {
  position: sticky;
  top: 6px;
  margin-left: -10px;
  padding: 0.3rem 0;
  width: 78px;
  text-align: center;
  font-weight: 700;
  border-radius: 2.5em;
  background: var(--c-base-background-lighter);
}
```

### タイムラインライン
```scss
.itemsContainer {
  margin-left: 2px;
  border-left: solid 2px var(--c-border);
}
```

### アイテムアイコン
```scss
.itemIcon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: solid 2px var(--c-border);
  background: var(--c-base-background);
  
  &:hover {
    border-color: var(--c-accent-primary);
    background: var(--c-accent-primary);
  }
}
```

---

## フォーム要素

### 入力フィールド
```scss
input, textarea, select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--c-border);
  border-radius: 0.375rem;
  background: var(--c-base-background-lighter);
  color: var(--c-base-text);
  font-family: var(--font-family-base);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--c-accent-primary);
  }
}
```

### ボタン
```scss
// プライマリボタン（アウトライン）
.primaryBtn {
  padding: 0.75rem 1rem;
  border: 1px solid var(--c-accent-primary);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--c-accent-primary);
  
  &:hover {
    background: var(--c-accent-primary);
    color: white;
  }
}

// セカンダリボタン
.secondaryBtn {
  padding: 0.75rem 1rem;
  border: 1px solid var(--c-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--c-gray);
}
```

---

## スクロールバー

```scss
// カスタムスクロールバー
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--c-border);
  border-radius: 3px;
  
  &:hover {
    background: var(--c-gray);
  }
}
```
