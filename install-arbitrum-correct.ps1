```powershell
# Script to install Arbitrum node exactly as per RTF instructions
$gcloudPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

Write-Host "Installing Arbitrum node software..." -ForegroundColor Yellow

& $gcloudPath compute ssh arbitrum-node --zone=us-west1-a --command="
sudo apt update && sudo apt install -y docker.io docker-compose git wget curl jq
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker \$USER

mkdir -p ~/arbitrum-data

ETH_IP=\$(gcloud compute instances describe eth-node --zone=us-central1-a --format='get(networkInterfaces[0].networkIP)')

docker run --rm -it -v ~/arbitrum-data:/home/user/.arbitrum -p 8545:8545 -p 8546:8548 offchainlabs/nitro-node:v3.6.8-d6c96a5 --chain.name=arb1 --parent-chain.connection.url=http://\$ETH_IP:8545 --parent-chain.blob-client.beacon-url=http://\$ETH_IP:5052 --http.api=net,web3,eth,arb --http.corsdomain=* --http.addr=0.0.0.0 --http.vhosts=* --ws.port=8546 --ws.addr=0.0.0.0 --ws.origins=* --node.feed.input.url=wss://arb1.arbitrum.io/feed --init.latest=pruned --init.latest-base=https://snapshot.arbitrum.foundation/ > nitro.log 2>&1 &

echo 'Arbitrum node started'
"

Write-Host "Arbitrum node installation completed!" -ForegroundColor Green
```