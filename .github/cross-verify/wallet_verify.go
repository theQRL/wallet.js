// Verify wallet.js signature with go-qrllib
// This script reads /tmp/wallet_js_output.json and verifies the signature
package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"

	"github.com/theQRL/go-qrllib/crypto/ml_dsa_87"
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

	signatureBytes, _ := hex.DecodeString(output.Signature)
	messageBytes, _ := hex.DecodeString(output.MessageHex)
	publicKeyBytes, _ := hex.DecodeString(output.PublicKey)

	// Convert to fixed-size arrays as required by go-qrllib
	var signature [ml_dsa_87.CRYPTO_BYTES]uint8
	copy(signature[:], signatureBytes)

	var pk [ml_dsa_87.CRYPTO_PUBLIC_KEY_BYTES]uint8
	copy(pk[:], publicKeyBytes)

	fmt.Println("Verifying wallet.js signature with go-qrllib...")
	fmt.Printf("  Address: %s\n", output.Address)
	fmt.Printf("  Message: %s\n", output.Message)

	// Use "ZOND" context to match wallet.js (@theqrl/mldsa87 default)
	ctx := []byte("ZOND")
	isValid := ml_dsa_87.Verify(ctx, messageBytes, signature, &pk)

	if isValid {
		fmt.Println("PASSED: wallet.js signature verified successfully")
		os.Exit(0)
	} else {
		fmt.Println("FAILED: Signature verification failed")
		os.Exit(1)
	}
}
