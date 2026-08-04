import { Assignment } from "../types";

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "asgn-001",
    moduleId: "mod-101",
    title: "Build a Custom NumPy Array Processing Pipeline",
    description: "Implement matrix transformations and vectorized data loading for high-dimensional tensors.",
    instructions: "1. Create a script named `pipeline.py`.\n2. Load dataset using numpy.\n3. Compute mean, variance, and normalize tensors.\n4. Save output to `processed.npy`.",
    dueDate: "2026-08-15T23:59:59.000Z",
    maxScore: 100,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    module: { id: "mod-101", title: "Module 1: Introduction to Python & AI Ecosystem" }
  },
  {
    id: "asgn-002",
    moduleId: "mod-102",
    title: "Train a Multi-Layer Perceptron (MLP) for MNIST Classification",
    description: "Construct a 3-layer neural network from scratch using PyTorch and evaluate accuracy on test split.",
    instructions: "Implement model class inheriting from `nn.Module`. Target > 95% validation accuracy. Include loss curves graph in submission link.",
    dueDate: "2026-08-20T23:59:59.000Z",
    maxScore: 100,
    createdAt: "2026-08-02T14:30:00.000Z",
    updatedAt: "2026-08-02T14:30:00.000Z",
    module: { id: "mod-102", title: "Module 2: Neural Networks & PyTorch Basics" }
  },
  {
    id: "asgn-003",
    moduleId: "mod-201",
    title: "Fine-tune Llama 3 8B using LoRA & PEFT",
    description: "Apply Parameter-Efficient Fine-Tuning (PEFT) on a custom domain dataset and generate evaluation metrics.",
    instructions: "Submit GitHub repo URL containing `finetune.py`, `adapter_config.json`, and benchmark comparison chart against base model.",
    dueDate: "2026-08-28T23:59:59.000Z",
    maxScore: 150,
    createdAt: "2026-08-03T09:15:00.000Z",
    updatedAt: "2026-08-03T09:15:00.000Z",
    module: { id: "mod-201", title: "Module 3: Transformers & Fine-tuning LLMs" }
  },
  {
    id: "asgn-004",
    moduleId: "mod-202",
    title: "RAG Pipeline with Pinecone and LangChain",
    description: "Build an end-to-end Retrieval-Augmented Generation service using Pinecone vector database.",
    instructions: "Store document embeddings in Pinecone, construct retrieval chain with hybrid search, and handle hallucination filtering.",
    dueDate: "2026-08-10T23:59:59.000Z",
    maxScore: 100,
    createdAt: "2026-07-28T11:00:00.000Z",
    updatedAt: "2026-07-28T11:00:00.000Z",
    module: { id: "mod-202", title: "Module 4: RAG Architectures & Vector Databases" }
  },
  {
    id: "asgn-005",
    moduleId: null,
    title: "Mid-Term Capstone Proposal & Architecture Spec",
    description: "Submit 2-page project proposal detailing problem statement, tech stack, data schema, and milestone schedule.",
    instructions: "PDF format or Google Docs link with view access. Include architecture diagram.",
    dueDate: null,
    maxScore: 50,
    createdAt: "2026-07-25T16:00:00.000Z",
    updatedAt: "2026-07-25T16:00:00.000Z",
    module: null
  }
];
