// Verify wallet.js signature with go-qrllib
// This script reads /tmp/wallet_js_output.json and verifies the signature
package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"

	"github.com/theQRL/go-qrllib/crypto"
)

type WalletOutput struct {
	Seed       string `json:"seed"`
	PublicKey  string `json:"publicKey"`
	Address    string `json:"address"`
	Message    string `json:"message"`
	MessageHex string `json:"messageHex"`
	Signature  string `json:"signature"`
}

func main() {
	data, err := os.ReadFile("/tmp/wallet_js_output.json")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to read input: %v\n", err)
		os.Exit(1)
	}

	var output WalletOutput
	if err := json.Unmarshal(data, &output); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to parse JSON: %v\n", err)
		os.Exit(1)
	}

	signature, _ := hex.DecodeString(output.Signature)
	message, _ := hex.DecodeString(output.MessageHex)
	publicKey, _ := hex.DecodeString(output.PublicKey)

	fmt.Println("Verifying wallet.js signature with go-qrllib...")
	fmt.Printf("  Address: %s\n", output.Address)
	fmt.Printf("  Message: %s\n", output.Message)

	isValid := crypto.MLDSA87Verify(signature, message, publicKey)

	if isValid {
		fmt.Println("PASSED: wallet.js signature verified successfully")
		os.Exit(0)
	} else {
		fmt.Println("FAILED: Signature verification failed")
		os.Exit(1)
	}
}
