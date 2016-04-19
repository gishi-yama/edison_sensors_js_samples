## 環境整備

https://software.intel.com/en-us/iot/hardware/edison/downloads

から、Installer をダウンロードしてインストール。

なお、Windowsの場合はイメージのアップデートで失敗することがあった。そのため、`Updateing Image` は解除してインストールとは別に行った方が良い。また、インストール自体に失敗する場合は、Driver softwareとFlash Tool Liteのみ個別にインストールしてもよい。

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

https://software.intel.com/en-us/iot/hardware/edison/downloads から、Release X.X Yocto* complete image をダウンロード・解凍する。

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

<!--
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
-->

### opkgリポジトリの追加

バージョンによって記載内容が異なるので注意。また、全パッケージをupgradeするのではなく、必要なものだけupgrade/installする。

#### Release 3.0 Yocto* complete image

```
cp /etc/opkg/base-feeds.conf /etc/opkg/base-feeds.conf.default; \
vi /etc/opkg/base-feeds.conf
  src all      http://iotdk.intel.com/repos/3.0/iotdk/all
  src x86      http://iotdk.intel.com/repos/3.0/iotdk/x86
  src i586     http://iotdk.intel.com/repos/3.0/iotdk/i586
  src core2-32 http://iotdk.intel.com/repos/3.0/iotdk/core2-32
```

#### Release 2.1 Yocto* complete image(edison-iotdk-image-280915)

```
cp /etc/opkg/base-feeds.conf /etc/opkg/base-feeds.conf.default; \
vi /etc/opkg/base-feeds.conf
  src all      http://iotdk.intel.com/repos/2.0/iotdk/all
  src x86      http://iotdk.intel.com/repos/2.0/iotdk/x86
  src i586     http://iotdk.intel.com/repos/2.0/iotdk/i586
  src core2-32 http://iotdk.intel.com/repos/2.0/iotdk/core2-32
```


#### パッケージリストの更新

```
opkg update
opkg upgrade xdk-daemon
```

## 動作確認

Edisonの電源を落とし、Grove Starter Kitのベースシールドをとりつける。


## 開発環境の準備（JavaSecipt）

```
opkg upgrade mraa upm nodejs nodejs-npm
```

[Sensors Bring IoT Projects to Life](https://software.intel.com/en-us/iot/hardware/sensors) から動かしたいサンプルのコードを確認し、実行。

例として、[Grove Ear-clip Heart Rate Sensor](https://software.intel.com/en-us/iot/hardware/sensors/grove-ear-clip-heart-rate-sensor)のJavascript Samplesの内容を sample1.js に書き込み、D2にGrove Ear-clip Heart Rate Sensorを接続して、

```
node sample1.js
```

で動作を確認。（コンソールに心拍数などが表示される。）

- [node.js版のmraaのAPI](http://iotdk.intel.com/docs/master/mraa/node/)
- [node.js版のupmのAPI](http://iotdk.intel.com/docs/master/upm/node/)

などを参考にしながら、コードの変更などを試す。



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

