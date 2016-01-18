## 環境整備

https://software.intel.com/en-us/iot/hardware/edison/downloads

から、Installerをダウンロードしてインストール。

もしくは

- [FTDI USB Drive](http://www.ftdichip.com/Drivers/VCP.htm)
- [xdk](https://software.intel.com/en-us/html5/xdk-iot)
- [Flash Tool Lite](https://software.intel.com/en-us/iot/hardware/edison/downloads)

をインストール。



## Intel Edison の組み立て

組み立てる。EdisonとArdinoボードの接触に注意。

J16とPCをUSBケーブルで接続する。

USBにEdisonのリムーバブルディスクがマウントされるので、ディスクユーティリティを起動し、EDISON, FAT(MS-DOS)で初期化する。

## 動作確認

リムーバブルディスクをアンマウントし、J3にケーブルを切り替える。

screenコマンドで、Edisonにアクセスできることを確認する。（XXXXXXXXはデバイスごとに異なるので、Tabなどで補完する）

```
screen /dev/cu.usbserial-XXXXXXXX 115200 -L
  # 実行するとブランク画面になるので、エンターキー
```

`edison login :` が表示されたら、root でログインする。

バージョンを確認する。

```
uname -a
cat /etc/version
  # Weekly-159 以下であれば、OS,ファームウェアのアップデートを行う。
```

電源を落とし、screenを殺す。

```
shutdown -h now
  
  # [  OK  ] Reached target Shutdown. を確認して、C-a k（CTRL+a+k）→ y
```

**注意**

screenのkillは、簡単に言えばディスプレイを抜くイメージ。Edisonを終了するときは必ず`shutdown`コマンドを叩くか、ログアウトしておく場合はexitコマンドなどを実行してからscreenをkillする。

## OS,ファームウェアのアップデート

### Flash Tool Lite を使う方法

J3からUSBケーブルを取り外す。このとき、Edisonの**電源が必ず落ちている**必要がある。screenから`shutdown`するか、SW1UI2スイッチを長押しして電源を落とす。

https://software.intel.com/en-us/iot/hardware/edison/downloads から、Release 2.1 Yocto* complete image(edison-iotdk-image-280915) をダウンロード・解凍する。

Flash Tool Liteを起動して、FlashEdison.json を読み込む。

MAC/Linuxが母艦の場合は、configurationを`CDC`に切り替える。

`start to flash` ボタンを押すと、J16に接続するように促されるので、接続し直す。

アップデートが完了し、改めてEdisonのリムーバブルディスクがマウントされていればOK。動作確認の方法でバージョンアップされていることを確認する。

### 他のインストール方法

EdisonのリムーバブルディスクにOS-imageをコピーして、screenから

```
reboot ota
```

で更新することもできる。この場合、`/home`以下などを保存したまま更新が実行できる。

ただし、Release 2.1 Yocto* complete imageはファイル容量がEdisonのリムーバブルディスク領域より大きいのでこの手段は使えない。Release 2.0 Yocto* complete image(edison-image-ww25.5-15.zip)以下であれば実行できる。

## 初期設定

```
configure_edison --setup
```

パスワード、ユニーク名、WI-FI設定が行える。ここから先は**edison00**という名前で、WI-FI設定をしていることを前提とする。

WI-FI設定ができれば、ネットワークからアクセスできる。
ブラウザで http://edison00.local/ にアクセスして、情報が出ればOK。

また、SSHでのアクセスも出来るようになる。

```
ssh root@edison00.local 
  # 既に他のサーバ用にssh configなどの設定がある場合は、-o PreferredAuthentications=password
```

## 必要な下回りの準備（開発用）


### sh -> bash
```
echo $SHELL
    # /bin/sh になっていれば継続
chsh -s /bin/bash
exit
```

再ログイン(SSHなどで入り直してもよい)

### タイムゾーンの設定

```
timedatectl set-timezone Asia/Tokyo
```

### .bash_profile

```
echo "alias ll='ls -la --color=auto'" >.bash_profile; \
echo "rm='rm -i'" >>.bash_profile; \
source .bash_profile
```

### /boot の拡張

```
mount /boot; \
mkdir /tmp/boot; \
mv /boot/* /tmp/boot; \
umount /boot; \
mkfs.vfat /dev/mmcblk0p7; \
mount /boot; \
cp -a /tmp/boot/* /boot
```

### opkgリポジトリの追加

バージョンによって記載内容が異なるので注意。

#### Release 2.1 Yocto* complete image(edison-iotdk-image-280915)

```
cp /etc/opkg/base-feeds.conf /etc/opkg/base-feeds.conf.default; \
vi /etc/opkg/base-feeds.conf
  src all      http://iotdk.intel.com/repos/2.0/iotdk/all
  src x86      http://iotdk.intel.com/repos/2.0/iotdk/x86
  src i586     http://iotdk.intel.com/repos/2.0/iotdk/i586
  src core2-32 http://iotdk.intel.com/repos/2.0/iotdk/core2-32
```

#### edison-image-rel1-maint-rel1-ww42-14

```
cp /etc/opkg/base-feeds.conf /etc/opkg/base-feeds.conf.default; \
vi /etc/opkg/base-feeds.conf
  src/gz all        http://repo.opkg.net/edison/repo/all
  src/gz edison     http://repo.opkg.net/edison/repo/edison
  src/gz core2-32   http://repo.opkg.net/edison/repo/core2-32
```

```
vi /etc/opkg/mraa-upm.conf
  src mraa-upm http://iotdk.intel.com/repos/2.0/intelgalactic
  # 必要に応じて追加
    # src iotdk-all http://iotdk.intel.com/repos/2.0/iotdk/all
    # src iotdk-i586 http://iotdk.intel.com/repos/2.0/iotdk/i586
    # src iotdk-x86 http://iotdk.intel.com/repos/2.0/iotdk/x86
```

#### パッケージの更新

```
opkg update; \
opkg upgrade mraa upm nodejs nodejs-npm
```

## 動作確認

Edisonの電源を落とし、Grove Starter Kitのベースシールドをとりつける。


## 開発環境の準備



## 参考
- [Intel EdisonではじめるIoTプロトタイピング](http://www.amazon.co.jp/dp/4798143391)
- http://edison-lab.jp/gettingstarted/edison-arduino/mac/
- http://edison-lab.jp/flash/mac/
- https://software.intel.com/en-us/iot/hardware/edison/downloads
- http://qiita.com/yoneken/items/1b24f0dd8ae00579a0c2
- http://netbuffalo.doorblog.jp/archives/4974689.html
- http://ticablog.com/archives/647
- http://kei-sakaki.jp/2015/05/08/intel-edison-firmware-release-2-1-published/
- http://dev.classmethod.jp/hardware/09-edison-getting-started-guide-mac/
- https://communities.intel.com/thread/59757
- http://qiita.com/hirose504@github/items/bc38a5265a1dbf356999
- http://dev.classmethod.jp/hardware/edison-btnled/
- http://blog.gaku.net/intel-edison-opkg-configuration/
- http://qiita.com/hishi/items/47e15c7f1b398357a8e2
