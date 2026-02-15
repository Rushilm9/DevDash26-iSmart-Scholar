import os
from dotenv import load_dotenv
from langchain_openai import AzureChatOpenAI

load_dotenv()

class LLMClient:
    def __init__(self):
        """Initialize Azure OpenAI Chat model."""
        self.llm = AzureChatOpenAI(
            azure_deployment="gpt-4o",
            openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        )

    def chat(self, prompt: str) -> str:
        """Send a text prompt and return the LLM's response."""
        try:
            response = self.llm.invoke(prompt)
            return response.content if hasattr(response, "content") else str(response)
        except Exception as e:
            return f"[LLM Error] {str(e)}"