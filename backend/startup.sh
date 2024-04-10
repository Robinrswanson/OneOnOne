python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt

cd OneOnOne
python3 manage.py reset_db <<EOF
yes
EOF
python3 manage.py makemigrations
python3 manage.py migrate
cd ..