import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 同じWi-Fiのスマホから開発サーバーを見るため、PCのLAN IPを許可する
  // （IPが変わったらここも更新する）
  allowedDevOrigins: ["172.16.20.151"],
};

export default nextConfig;
