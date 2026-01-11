// Generate wallet signature with go-qrllib for cross-implementation verification
// This script generates a signature and writes to /tmp/go_qrllib_output.json
package main

import (
	"crypto/sha256"
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

const (
	testSeedHex = "f29f58aff0b00de2844f7e20bd9eeaacc379150043beeb328335817512b29fbb7184da84a092f842b2a06d72a24a5d28"
	testMessage = "Cross-implementation verification test message"
)

func main() {
	seedBytes, _ := hex.DecodeString(testSeedHex)

	// Hash the 48-byte seed with SHA256 to get 32 bytes (matching wallet.js)
	seedHash := sha256.Sum256(seedBytes)

	// Create ML-DSA-87 instance from the 32-byte seed
	mldsa, err := ml_dsa_87.NewMLDSA87FromSeed(seedHash)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create MLDSA87: %v\n", err)
		os.Exit(1)
	}
	defer mldsa.Zeroize()

	// Sign message with "ZOND" context to match wallet.js (@theqrl/mldsa87 default)
	ctx := []byte("ZOND")
	message := []byte(testMessage)
	signature, err := mldsa.Sign(ctx, message)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to sign: %v\n", err)
		os.Exit(1)
	}

	pk := mldsa.GetPK()

	output := WalletOutput{
		Seed:       testSeedHex,
		PublicKey:  hex.EncodeToString(pk[:]),
		Address:    "TODO: derive address",
		Message:    testMessage,
		MessageHex: hex.EncodeToString(message),
		Signature:  hex.EncodeToString(signature[:]),
	}

	data, _ := json.MarshalIndent(output, "", "  ")
	os.WriteFile("/tmp/go_qrllib_output.json", data, 0644)

	fmt.Println("go-qrllib signature generated:")
	fmt.Printf("  PK (first 64 chars): %s...\n", output.PublicKey[:64])
	fmt.Printf("  Signature (first 64 chars): %s...\n", output.Signature[:64])
}
