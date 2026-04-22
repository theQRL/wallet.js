// Generate wallet signature with go-qrllib for cross-implementation verification
// This script generates a signature and writes to $TMPDIR/wallet_cross_verify/go_qrllib_output.json
package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/theQRL/go-qrllib/wallet/common"
	walletml "github.com/theQRL/go-qrllib/wallet/ml_dsa_87"
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

const (
	testSeedHex = "f29f58aff0b00de2844f7e20bd9eeaacc379150043beeb328335817512b29fbb7184da84a092f842b2a06d72a24a5d28"
	testMessage = "Cross-implementation verification test message"
)

func main() {
	seedBytes, _ := hex.DecodeString(testSeedHex)
	var seed common.Seed
	copy(seed[:], seedBytes)

	// Wallet-layer API builds the domain-separated signing context
	// ("ZOND" || version || descriptor) internally, matching wallet.js.
	wallet, err := walletml.NewWalletFromSeed(seed)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create wallet: %v\n", err)
		os.Exit(1)
	}
	defer wallet.Zeroize()

	message := []byte(testMessage)
	signature, err := wallet.Sign(message)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to sign: %v\n", err)
		os.Exit(1)
	}

	pk := wallet.GetPK()
	desc := wallet.GetDescriptor().ToDescriptor()

	output := WalletOutput{
		Seed:           testSeedHex,
		PublicKey:      hex.EncodeToString(pk[:]),
		Descriptor:     hex.EncodeToString(desc[:]),
		SigningContext: hex.EncodeToString(common.SigningContext(desc)),
		Address:        wallet.GetAddressStr(),
		Message:        testMessage,
		MessageHex:     hex.EncodeToString(message),
		Signature:      hex.EncodeToString(signature[:]),
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
