# run.py

from app import create_app

# Create the Flask app instance using the factory function
app = create_app()

# This block runs only when the script is executed directly
if __name__ == '__main__':
    # Run the app with debug mode enabled on port 5555
    app.run(port=5555, debug=True)