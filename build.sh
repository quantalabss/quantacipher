#!/bin/bash
export PATH=$HOME/.cargo/bin:$PATH

echo "Building Rust Core..."
cd quantacipher-core
cargo build

echo "Building WASM..."
cd ../quantacipher-wasm
wasm-pack build --target web --out-dir pkg

echo "Building JS SDK..."
cd ../quantacipher-sdk-js
npm install
npm run build

echo "Building Python SDK..."
cd ../quantacipher-python
pip install maturin
maturin build --release

echo "All builds completed successfully!"
