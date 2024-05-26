package tree_sitter_plume_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-plume"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_plume.Language())
	if language == nil {
		t.Errorf("Error loading Plume grammar")
	}
}
