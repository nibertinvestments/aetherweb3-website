```powershell
# Script to install Ethereum node exactly as per RTF instructions
$gcloudPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

Write-Host "Installing Ethereum node software..." -ForegroundColor Yellow

& $gcloudPath compute ssh eth-node --zone=us-central1-a --command="
sudo apt update && sudo apt install -y wget curl unzip git make gcc g++ jq software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt update && sudo apt install -y ethereum

curl -LO https://github.com/sigp/lighthouse/releases/download/v5.3.0/lighthouse-v5.3.0-x86_64-unknown-linux-gnu.tar.gz
tar -xzf lighthouse-v5.3.0-x86_64-unknown-linux-gnu.tar.gz
sudo mv lighthouse /usr/local/bin/

mkdir -p ~/ethereum/datadir ~/ethereum/beacon

geth --datadir ~/ethereum/datadir init

nohup geth --datadir ~/ethereum/datadir --http --http.addr 0.0.0.0 --http.port 8545 --http.api eth,net,web3 --ws --ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,net,web3 --syncmode full > geth.log 2>&1 &

nohup lighthouse bn --network mainnet --datadir ~/ethereum/beacon --http --http-address 0.0.0.0 --http-port 5052 > lighthouse.log 2>&1 &

echo 'Ethereum node started'
"

Write-Host "Ethereum node installation completed!" -ForegroundColor Green
```