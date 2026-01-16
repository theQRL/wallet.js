// Generate wallet signature with go-qrllib for cross-implementation verification
// This script generates a signature and writes to $TMPDIR/wallet_cross_verify/go_qrllib_output.json
package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

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

	// Create secure output directory (remove any existing symlink/file first)
	outputDir := filepath.Join(os.TempDir(), "wallet_cross_verify")
	if err := os.RemoveAll(outputDir); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to clean output directory: %v\n", err)
		os.Exit(1)
	}
	if err := os.MkdirAll(outputDir, 0700); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create output directory: %v\n", err)
		os.Exit(1)
	}

	data, _ := json.MarshalIndent(output, "", "  ")
	outputPath := filepath.Join(outputDir, "go_qrllib_output.json")
	if err := os.WriteFile(outputPath, data, 0600); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to write output: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("go-qrllib signature generated:")
	fmt.Printf("  PK (first 64 chars): %s...\n", output.PublicKey[:64])
	fmt.Printf("  Signature (first 64 chars): %s...\n", output.Signature[:64])
}
