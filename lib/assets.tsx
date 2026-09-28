"use client";

import { createContext, useContext } from "react";

// /public 配下に実在するメディアファイルの一覧（サーバーで走査して渡す）。
// 存在しないファイルは最初からリクエストしないので、404やちらつきが起きない。

const AssetContext = createContext<Set<string>>(new Set());

export function AssetProvider({ files, children }: { files: string[]; children: React.ReactNode }) {
  return <AssetContext.Provider value={new Set(files)}>{children}</AssetContext.Provider>;
}

export function useAssets() {
  const set = useContext(AssetContext);
  return {
    has: (path?: string) => !!path && set.has(path),
    /** 候補の中から最初に存在するものを返す */
    pick: (...paths: (string | undefined)[]) => paths.find((p) => p && set.has(p)),
  };
}
