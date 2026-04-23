// Verify wallet.js signature with go-qrllib
// This script reads /tmp/wallet_js_output.json and verifies the signature
package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"

	walletml "github.com/theQRL/go-qrllib/wallet/ml_dsa_87"
	"github.com/theQRL/go-qrllib/wallet/common/descriptor"
)

type WalletOutput struct {
	Seed           string `json:"seed"`
	PublicKey      string `json:"publicKey"`
	Descriptor     string `json:"descriptor"`
	SigningContext string `json:"signingContext"`
	Address        string `json:"address"`
	Message        string `json:"message"`
	MessageHex     string `json:"messageHex"`
	Signature      string `json:"signature"`
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

	signatureBytes, _ := hex.DecodeString(output.Signature)
	messageBytes, _ := hex.DecodeString(output.MessageHex)
	publicKeyBytes, _ := hex.DecodeString(output.PublicKey)
	descriptorBytes, _ := hex.DecodeString(output.Descriptor)

	var pk walletml.PK
	copy(pk[:], publicKeyBytes)

	var desc [descriptor.DescriptorSize]byte
	copy(desc[:], descriptorBytes)

	fmt.Println("Verifying wallet.js signature with go-qrllib...")
	fmt.Printf("  Address: %s\n", output.Address)
	fmt.Printf("  Message: %s\n", output.Message)
	fmt.Printf("  Descriptor: %s\n", output.Descriptor)

	// Wallet-level Verify binds the signature to the descriptor via the
	// domain-separated signing context (`"ZOND" || version || descriptor`).
	isValid := walletml.Verify(messageBytes, signatureBytes, &pk, desc)

	if isValid {
		fmt.Println("PASSED: wallet.js signature verified successfully")
		os.Exit(0)
	} else {
		fmt.Println("FAILED: Signature verification failed")
		os.Exit(1)
	}
}
