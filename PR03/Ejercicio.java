import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.*;
import java.util.regex.*;

public class Ejercicio extends JFrame {
    private int idCounter = 401;
    private int consCounter = 600;
    
    private JTextArea sqlInput;
    private JPanel resultSection;
    private JTable identificadoresTable;
    private JTable constantesTable;
    
    public Ejercicio() {
        setTitle("Analizador de Sentencias SQL");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 800);
        setLocationRelativeTo(null);
        
        initComponents();
    }
    
    private void initComponents() {
        JPanel container = new JPanel();
        container.setLayout(new BoxLayout(container, BoxLayout.Y_AXIS));
        container.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        container.setBackground(Color.WHITE);
        
        JLabel title = new JLabel("PR03 Sentencias SQL");
        title.setFont(new Font("Arial", Font.BOLD, 24));
        title.setAlignmentX(Component.CENTER_ALIGNMENT);
        title.setForeground(new Color(51, 51, 51));
        
        JLabel description = new JLabel("");
        description.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        sqlInput = new JTextArea();
        sqlInput.setFont(new Font("Monospaced", Font.PLAIN, 12));
        sqlInput.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(new Color(221, 221, 221)),
            BorderFactory.createEmptyBorder(10, 10, 10, 10)
        ));
        sqlInput.setText("SELECT ANOMBRE, CALIFICACION, TURNO\n" +
            "FROM ALUMNOS, INSCRITOS, MATERIAS, CARRERAS\n" +
            "WHERE MNOMBRE='PROGSIST' AND TURNO = 'TM'\n" +
            "AND CNOMBRE='IDS' AND SEMESTRE='EJ2025' AND CALIFICACION >= 60");
        
        JScrollPane sqlScroll = new JScrollPane(sqlInput);
        sqlScroll.setMaximumSize(new Dimension(Integer.MAX_VALUE, 150));
        
        JButton analyzeButton = new JButton("Analizar");
        analyzeButton.setBackground(new Color(76, 5, 80));
        analyzeButton.setForeground(Color.WHITE);
        analyzeButton.setFont(new Font("Arial", Font.PLAIN, 16));
        analyzeButton.setAlignmentX(Component.CENTER_ALIGNMENT);
        analyzeButton.addActionListener(e -> analizar());
        
        resultSection = new JPanel();
        resultSection.setLayout(new BoxLayout(resultSection, BoxLayout.Y_AXIS));
        resultSection.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(221, 221, 221)),
            BorderFactory.createEmptyBorder(20, 0, 0, 0)
        ));
        resultSection.setVisible(false);
        
        JLabel resultTitle = new JLabel("Resultados del Análisis");
        resultTitle.setFont(new Font("Arial", Font.BOLD, 18));
        resultTitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JPanel tablesContainer = new JPanel();
        tablesContainer.setLayout(new GridLayout(1, 2, 20, 0));
        
        JPanel idWrapper = new JPanel(new BorderLayout());
        JLabel idLabel = new JLabel("Tabla de Identificadores");
        idLabel.setFont(new Font("Arial", Font.BOLD, 14));
        
        identificadoresTable = new JTable(new DefaultTableModel(
            new Object[]{"Identificador", "Valor", "Línea"}, 0
        ));
        identificadoresTable.setFont(new Font("Arial", Font.PLAIN, 12));
        
        JScrollPane idScroll = new JScrollPane(identificadoresTable);
        idWrapper.add(idLabel, BorderLayout.NORTH);
        idWrapper.add(idScroll, BorderLayout.CENTER);
        
        JPanel constWrapper = new JPanel(new BorderLayout());
        JLabel constLabel = new JLabel("Tabla de Constantes");
        constLabel.setFont(new Font("Arial", Font.BOLD, 14));
        
        constantesTable = new JTable(new DefaultTableModel(
            new Object[]{"Constante", "Valor", "Línea"}, 0
        ));
        constantesTable.setFont(new Font("Arial", Font.PLAIN, 12));
        
        JScrollPane constScroll = new JScrollPane(constantesTable);
        constWrapper.add(constLabel, BorderLayout.NORTH);
        constWrapper.add(constScroll, BorderLayout.CENTER);
        
        tablesContainer.add(idWrapper);
        tablesContainer.add(constWrapper);
        
        resultSection.add(resultTitle);
        resultSection.add(Box.createVerticalStrut(10));
        resultSection.add(tablesContainer);
        
        container.add(title);
        container.add(Box.createVerticalStrut(10));
        container.add(description);
        container.add(Box.createVerticalStrut(20));
        container.add(sqlScroll);
        container.add(Box.createVerticalStrut(20));
        container.add(analyzeButton);
        container.add(Box.createVerticalStrut(20));
        container.add(resultSection);
        
        add(container);
    }
    
    private void analizar() {
        String sqlQuery = sqlInput.getText().trim();
        
        if (sqlQuery.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Por favor, ingrese una sentencia SQL válida.", 
                "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        idCounter = 401;
        consCounter = 600;
        
        ((DefaultTableModel)identificadoresTable.getModel()).setRowCount(0);
        ((DefaultTableModel)constantesTable.getModel()).setRowCount(0);
        resultSection.setVisible(true);
        
        String[] lines = sqlQuery.split("\n");
        Map<String, Identificador> identificadores = new LinkedHashMap<>();
        Map<String, Constante> constantes = new LinkedHashMap<>();
        
        String[] palabrasReservadas = {"SELECT", "FROM", "WHERE", "AND", "OR", "LIKE", "IN", "NOT", 
            "IS", "NULL", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", 
            "ORDER", "BY", "HAVING", "AS", "DISTINCT", "COUNT", "SUM", "AVG", "MAX", "MIN"};
        String[] operadores = {"=", "<", ">", "<=", ">=", "<>", "!=", "+", "-", "*", "/", "%", "&", "|", "^", "~"};
        
        for (int i = 0; i < lines.length; i++) {
            int lineNumber = i + 1;
            String line = lines[i].trim();
            
            if (line.isEmpty()) continue;

            // 1. Extraer todas las constantes primero (entre comillas y numéricas)
            Pattern constPattern = Pattern.compile("'([^']*)'|(\\b\\d+\\b)");
            Matcher constMatcher = constPattern.matcher(line);
            
            while (constMatcher.find()) {
                String constante = constMatcher.group(1) != null ? constMatcher.group(1) : constMatcher.group(2);
                if (constante == null) continue;
                
                if (!constantes.containsKey(constante)) {
                    constantes.put(constante, new Constante(consCounter++, lineNumber));
                } else {
                    constantes.get(constante).addLinea(lineNumber);
                }
            }

            // 2. Procesar identificadores (excluyendo constantes y palabras reservadas)
            String[] words = line.split("[\\s,()]+");
            
            for (String word : words) {
                if (word.isEmpty()) continue;
                
                // Saltar operadores completos (como '>=')
                if (Arrays.asList(operadores).contains(word)) continue;
                
                // Dividir por operadores para casos como "CALIFICACION>=60"
                String[] subTokens = word.split("([=<>!]+)");
                
                for (String token : subTokens) {
                    if (token.isEmpty()) continue;
                    
                    // Saltar si es operador, palabra reservada o constante
                    if (Arrays.asList(operadores).contains(token) || 
                        Arrays.asList(palabrasReservadas).contains(token.toUpperCase()) ||
                        token.matches("^\\d+$")) {
                        continue;
                    }
                    
                    // Eliminar comillas si las tiene
                    String cleanToken = token.replaceAll("^'(.*)'$", "$1");
                    if (!cleanToken.equals(token)) continue; // Si tenía comillas, es constante y ya la procesamos
                    
                    // Es un identificador válido
                    if (!identificadores.containsKey(cleanToken)) {
                        identificadores.put(cleanToken, new Identificador(idCounter++, lineNumber));
                    } else {
                        identificadores.get(cleanToken).addLinea(lineNumber);
                    }
                }
            }
        }

        // Mostrar resultados
        mostrarResultados(identificadores, constantes);
    }
    
    private void mostrarResultados(Map<String, Identificador> identificadores, Map<String, Constante> constantes) {
        DefaultTableModel idModel = (DefaultTableModel) identificadoresTable.getModel();
        DefaultTableModel constModel = (DefaultTableModel) constantesTable.getModel();
        
        // Mostrar identificadores
        for (Map.Entry<String, Identificador> entry : identificadores.entrySet()) {
            idModel.addRow(new Object[]{
                entry.getKey(),
                entry.getValue().getValor(),
                entry.getValue().getLineasAsString()
            });
        }
        
        // Mostrar constantes
        for (Map.Entry<String, Constante> entry : constantes.entrySet()) {
            constModel.addRow(new Object[]{
                entry.getKey(),
                entry.getValue().getValor(),
                entry.getValue().getLineasAsString()
            });
        }
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            Ejercicio analyzer = new Ejercicio();
            analyzer.setVisible(true);
        });
    }
    
    private static class Identificador {
        private int valor;
        private Set<Integer> lineas;
        
        public Identificador(int valor, int primeraLinea) {
            this.valor = valor;
            this.lineas = new TreeSet<>();
            this.lineas.add(primeraLinea);
        }
        
        public void addLinea(int linea) {
            lineas.add(linea);
        }
        
        public int getValor() {
            return valor;
        }
        
        public String getLineasAsString() {
            StringBuilder sb = new StringBuilder();
            Iterator<Integer> it = lineas.iterator();
            while (it.hasNext()) {
                sb.append(it.next());
                if (it.hasNext()) {
                    sb.append(", ");
                }
            }
            return sb.toString();
        }
    }
    
    private static class Constante {
        private int valor;
        private Set<Integer> lineas;
        
        public Constante(int valor, int primeraLinea) {
            this.valor = valor;
            this.lineas = new TreeSet<>();
            this.lineas.add(primeraLinea);
        }
        
        public void addLinea(int linea) {
            lineas.add(linea);
        }
        
        public int getValor() {
            return valor;
        }
        
        public String getLineasAsString() {
            StringBuilder sb = new StringBuilder();
            Iterator<Integer> it = lineas.iterator();
            while (it.hasNext()) {
                sb.append(it.next());
                if (it.hasNext()) {
                    sb.append(", ");
                }
            }
            return sb.toString();
        }
    }
}