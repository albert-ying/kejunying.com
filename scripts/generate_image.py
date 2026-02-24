import os
import sys
import argparse
import base64
import requests
from pathlib import Path

# Try to load dotenv if available, but don't fail if not
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass


def setup_args():
    parser = argparse.ArgumentParser(
        description="Generate or edit images using OpenRouter API"
    )
    parser.add_argument(
        "prompt",
        help="Text description of the image to generate or editing instructions",
    )
    parser.add_argument(
        "-i", "--input", help="Input image path for editing (enables edit mode)"
    )
    parser.add_argument(
        "-m",
        "--model",
        default="google/gemini-3-pro-image-preview",
        help="OpenRouter model ID",
    )
    parser.add_argument(
        "-o", "--output", default="generated_image.png", help="Output file path"
    )
    parser.add_argument("--api-key", help="OpenRouter API key (overrides .env file)")
    return parser.parse_args()


def get_api_key(args):
    api_key = args.api_key or os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OpenRouter API key not found.")
        print(
            "Please set OPENROUTER_API_KEY in your .env file or environment variables,"
        )
        print("or pass it with --api-key.")
        print("You can get a key from: https://openrouter.ai/keys")
        sys.exit(1)
    return api_key


def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def generate_image(prompt, model, api_key, input_image=None):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/K-Dense/claude-scientific-skills",
        "X-Title": "Claude Scientific Skills",
    }

    data = {
        "model": model,
        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
    }

    if input_image:
        # For editing, we need to check if the model supports it and format accordingly
        # This is a simplified implementation assuming the model accepts image input in the message
        encoded_image = encode_image(input_image)
        image_content = {
            "type": "image_url",
            "image_url": {"url": f"data:image/png;base64,{encoded_image}"},
        }
        data["messages"][0]["content"].append(image_content)

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        if hasattr(e, "response") and e.response:
            print(f"Response: {e.response.text}")
        sys.exit(1)


def save_image(response_data, output_path):
    try:
        # Handle different response formats
        # Some models return base64 in choices[0].message.content (e.g. Gemini)
        # Others might use a different format, but OpenRouter standardizes to chat completion

        content = response_data["choices"][0]["message"]["content"]

        # Check if content is a markdown image link or raw base64 or URL
        # Gemini often returns a markdown link like "![Image](https://...)" or base64

        # Simple heuristic to extract base64 or URL
        # This part might need adjustment based on specific model outputs

        image_data = None

        # Case 1: Base64 in content (sometimes wrapped in markdown)
        if "base64," in content:
            base64_str = content.split("base64,")[1].split(")")[0].split('"')[0].strip()
            image_data = base64.b64decode(base64_str)

        # Case 2: URL in content
        elif "http" in content:
            # Extract URL
            import re

            url_match = re.search(r"(https?://[^\s\)]+)", content)
            if url_match:
                url = url_match.group(1)
                img_response = requests.get(url)
                if img_response.status_code == 200:
                    image_data = img_response.content

        if not image_data:
            # Fallback: check if there is an 'images' field (unlikely in chat completion but possible in some APIs)
            print("Could not extract image from response.")
            print(f"Response content snippet: {content[:200]}...")
            sys.exit(1)

        with open(output_path, "wb") as f:
            f.write(image_data)
        print(f"Image saved to {output_path}")

    except Exception as e:
        print(f"Error saving image: {e}")
        print(f"Full response: {response_data}")
        sys.exit(1)


def main():
    args = setup_args()
    api_key = get_api_key(args)

    print(f"Generating image with prompt: '{args.prompt}' using model: {args.model}...")
    response = generate_image(args.prompt, args.model, api_key, args.input)
    save_image(response, args.output)


if __name__ == "__main__":
    main()
