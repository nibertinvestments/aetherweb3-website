```powershell
# Script to install Base node exactly as per RTF instructions
$gcloudPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

Write-Host "Installing Base node software..." -ForegroundColor Yellow

& $gcloudPath compute ssh base-node --zone=us-east1-b --command="
sudo apt update && sudo apt install -y docker.io docker-compose git wget curl jq
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker \$USER

git clone https://github.com/base-org/node
cd node

ETH_IP=\$(gcloud compute instances describe eth-node --zone=us-central1-a --format='get(networkInterfaces[0].networkIP)')
echo \"OP_NODE_L1_ETH_RPC=http://\$ETH_IP:8545\" >> .env.mainnet
echo \"OP_NODE_L1_BEACON=http://\$ETH_IP:5052\" >> .env.mainnet

mkdir geth-data
LATEST_FILE=\$(curl -s https://mainnet-reth-archive-snapshots.base.org/latest)
wget https://mainnet-reth-archive-snapshots.base.org/\$LATEST_FILE -O snapshot.tar
tar -xvf snapshot.tar -C geth-data/

sed -i 's/# env_file:/env_file:/' docker-compose.yml
sed -i 's/# - .env.mainnet/- .env.mainnet/' docker-compose.yml
sed -i '/--http.port=8545/a\      - --ws\n      - --ws.addr=0.0.0.0\n      - --ws.port=8546\n      - --ws.api=eth,net,web3' docker-compose.yml

docker compose up -d --build

echo 'Base node started'
"

Write-Host "Base node installation completed!" -ForegroundColor Green
```