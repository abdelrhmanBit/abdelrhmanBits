from flask import Flask, render_template, request
from db import get_connection, build_graph_with_lines, find_route_with_transfers, format_route_result, calculate_price

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/app', methods=['POST', 'GET'])
def main():
    connection = get_connection()
    connection.row_factory = lambda cursor, row: {"id": row[0], "name": row[1]}
    cursor = connection.cursor()
    cursor.execute("SELECT id, name FROM stations ORDER BY name")
    stations = [row["name"] for row in cursor.fetchall()]
    connection.close()
    
    if request.method == 'GET':
        return render_template('main.html', stations=stations)
    
    elif request.method == 'POST':
        start_name = request.form.get('start')
        end_name = request.form.get('end')
        
        connection = get_connection()
        connection.row_factory = lambda cursor, row: {"id": row[0]}
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM stations WHERE name=?", (start_name,))
        start_row = cursor.fetchone()
        cursor.execute("SELECT id FROM stations WHERE name=?", (end_name,))
        end_row = cursor.fetchone()
        connection.close()
        
        if start_row and end_row:
            start_id = start_row['id']
            end_id = end_row['id']

            graph = build_graph_with_lines()
            route_result = find_route_with_transfers(start_id, end_id, graph)
            
            if route_result:
                formatted_result = format_route_result(route_result, start_name, end_name)
                price = calculate_price(route_result['total_stations'])
                
                return render_template('main.html', 
                                     stations=stations, 
                                     route_data=formatted_result,
                                     price=price)
            else:
                return render_template('main.html', 
                                     stations=stations,
                                     error="⚠️ لا يوجد مسار بين المحطتين")
        else:
            return render_template('main.html', 
                                 stations=stations,
                                 error="⚠️ واحدة من المحطتين غير موجودة")

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/request_route')
def request_route():
    connection = get_connection()
    connection.row_factory = lambda cursor, row: {"id": row[0], "name": row[1]}
    cursor = connection.cursor()
    cursor.execute("SELECT id, name FROM stations ORDER BY name")
    stations = [row["name"] for row in cursor.fetchall()]
    connection.close()
    return render_template('request.html', stations=stations)

if __name__ == '__main__':
    app.run(debug=True)