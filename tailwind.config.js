module.exports = {
    content: ['./frontend/**/*.html', './frontend/js/**/*.js'],
    theme: {
        extend: {
            colors: {
                loveli: {
                    50: '#fff8fb',
                    100: '#fcecf2',
                    200: '#f8d8e4',
                    300: '#efb8ce',
                    400: '#df8eaf',
                    500: '#c85e8c',
                    700: '#8e365c',
                    900: '#3d2833'
                }
            },
            fontFamily: {
                display: ['Georgia', 'serif'],
                sans: ['Montserrat', 'Arial', 'sans-serif']
            },
            boxShadow: {
                soft: '0 16px 45px rgba(105,54,76,.09)'
            }
        }
    },
    plugins: []
};